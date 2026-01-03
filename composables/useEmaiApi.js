export function useEmaiApi() {
  const sendConfirmAccountEmail = (email) => $fetch(`/api/email/auth/confirmaccount/${email}`);

  return {
    sendConfirmAccountEmail
  };
}