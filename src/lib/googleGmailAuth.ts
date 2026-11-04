import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: "select_account",
});

// Flag indicating active popup sign-in flow
let isSigningIn = false;
// In-memory access token cache ONLY (never persisted to localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export interface VerifiedGmailIdentity {
  uid: string;
  gmailEmail: string;
  displayName: string;
  photoUrl: string | null;
  accessToken: string;
}

const VALID_GMAIL_REGEX = /^[^\s@]+@(gmail\.com|googlemail\.com)$/i;

export function isStrictGmailAddress(email: string | null | undefined): boolean {
  if (!email) return false;
  return VALID_GMAIL_REGEX.test(email.trim());
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogleGmail = async (): Promise<void> => {
  try {
    await auth.signOut();
  } finally {
    cachedAccessToken = null;
  }
};

/**
 * Opens Google Sign-In popup, verifies the Google People profile & email,
 * and strictly allows ONLY verified @gmail.com / @googlemail.com accounts.
 */
export const signInWithVerifiedGmail = async (): Promise<{
  identity: VerifiedGmailIdentity | null;
  errorEn?: string;
  errorAr?: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      await logoutGoogleGmail();
      return {
        identity: null,
        errorEn: "Unable to retrieve Google verification token. Please try again.",
        errorAr: "تعذر الحصول على رمز التحقق من Google. يرجى المحاولة مرة أخرى.",
      };
    }

    cachedAccessToken = credential.accessToken;

    // Fetch authoritative primary email & display name from Google People API using the OAuth token
    let resolvedEmail = (result.user.email || "").trim().toLowerCase();
    let resolvedName = (result.user.displayName || "").trim();
    let emailVerified = result.user.emailVerified;

    try {
      const peopleRes = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses",
        {
          headers: {
            Authorization: `Bearer ${cachedAccessToken}`,
          },
        }
      );

      if (peopleRes.ok) {
        const peopleData = (await peopleRes.json()) as {
          names?: { displayName?: string }[];
          emailAddresses?: {
            value?: string;
            metadata?: { primary?: boolean; verified?: boolean };
          }[];
        };

        const primaryEmailObj =
          peopleData.emailAddresses?.find((e) => e.metadata?.primary) ||
          peopleData.emailAddresses?.[0];

        if (primaryEmailObj?.value) {
          resolvedEmail = primaryEmailObj.value.trim().toLowerCase();
        }
        if (primaryEmailObj?.metadata?.verified !== undefined) {
          emailVerified = Boolean(primaryEmailObj.metadata.verified);
        }
        if (!resolvedName && peopleData.names?.[0]?.displayName) {
          resolvedName = peopleData.names[0].displayName.trim();
        }
      }
    } catch {
      // Fallback to Firebase Auth user email & verified status if People API call encounters network error
    }

    // Enforce: ONLY verified @gmail.com / @googlemail.com addresses are permitted
    if (!resolvedEmail || !emailVerified || !isStrictGmailAddress(resolvedEmail)) {
      await logoutGoogleGmail();
      return {
        identity: null,
        errorEn: resolvedEmail
          ? `Sign-in rejected for "${resolvedEmail}". Only a valid, verified @gmail.com account is permitted.`
          : "Only a valid, verified @gmail.com account can sign in directly.",
        errorAr: resolvedEmail
          ? `تم رفض الدخول للحساب "${resolvedEmail}". يُسمح بالدخول المباشر فقط لحسابات Gmail الصحيحة والموثقة (@gmail.com).`
          : "يُسمح بالدخول المباشر فقط عند استخدام حساب Gmail صحيح وموثق (@gmail.com).",
      };
    }

    const fallbackNameFromEmail = resolvedEmail
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (ch) => ch.toUpperCase());

    return {
      identity: {
        uid: result.user.uid,
        gmailEmail: resolvedEmail.replace(/@googlemail\.com$/i, "@gmail.com"),
        displayName: resolvedName || fallbackNameFromEmail || "Gmail User",
        photoUrl: result.user.photoURL || null,
        accessToken: cachedAccessToken,
      },
    };
  } catch (err: unknown) {
    cachedAccessToken = null;
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code)
        : "";

    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return {
        identity: null,
        errorEn: "Gmail sign-in window was closed before completing verification.",
        errorAr: "تم إغلاق نافذة تسجيل الدخول عبر Gmail قبل إكمال التحقق.",
      };
    }

    if (code === "auth/popup-blocked") {
      return {
        identity: null,
        errorEn: "Popup was blocked by your browser. Please allow popups for Gmail sign-in.",
        errorAr: "تم حظر النافذة المنبثقة في المتصفح. يرجى السماح بالنوافذ المنبثقة للدخول عبر Gmail.",
      };
    }

    return {
      identity: null,
      errorEn: "Unable to sign in with Gmail right now. Please try again.",
      errorAr: "تعذر تسجيل الدخول عبر Gmail حالياً. يرجى المحاولة مرة أخرى.",
    };
  } finally {
    isSigningIn = false;
  }
};
