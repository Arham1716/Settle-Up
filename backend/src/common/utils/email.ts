export async function sendInviteEmail(
  email: string,
  token: string,
  groupId: string,
) {
  // pretend we await a send email promise
  await Promise.resolve(
    console.log(
      `Sending invite email to ${email} with token ${token} for group ${groupId}`,
    ),
  );
}
