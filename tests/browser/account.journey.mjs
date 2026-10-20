export default async function journey(page, fixture) {
  const ensure = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  async function login(email, password = fixture.password) {
    await page.goto("http://127.0.0.1:5183/");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Sign in", exact: true })
      .last()
      .click();
    await page.getByRole("button", { name: "Sign out", exact: true }).waitFor();
  }
  async function logout() {
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.getByRole("heading", { name: "Sign in", exact: true }).waitFor();
  }
  async function emailLink(email, type) {
    let id;
    for (let i = 0; i < 30 && !id; i++) {
      const result = await page.request.get(
        `http://127.0.0.1:55424/api/v1/search?query=${encodeURIComponent("to:" + email)}`,
      );
      const body = await result.json();
      for (const message of body.messages ?? []) {
        const detail = await (
          await page.request.get(
            `http://127.0.0.1:55424/api/v1/message/${message.ID}`,
          )
        ).json();
        const html = detail.HTML ?? detail.Text ?? "";
        const links = html.match(/https?:[^\s"<>]+/g) ?? [];
        const link = links
          .map((value) => value.replaceAll("&amp;", "&"))
          .find(
            (value) =>
              value.includes("/auth/v1/verify?") &&
              value.includes("type=" + type),
          );
        if (link) return link;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error("Local intercepted verification email did not arrive");
  }
  await page.goto("http://127.0.0.1:5183/");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill(fixture.signupEmail);
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .last()
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Check your email" })
    .waitFor();
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Sign in required" })
    .waitFor();
  await page.goto(await emailLink(fixture.signupEmail, "signup"));
  await page.getByRole("button", { name: "Sign out", exact: true }).waitFor();
  await page
    .getByLabel("Organization name", { exact: true })
    .fill("Synthetic signup shop");
  await page
    .getByRole("button", { name: "Create organization", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Organization created" })
    .waitFor();
  ensure(
    !page.url().includes("access_token"),
    "Callback fragment was retained",
  );
  ensure(
    await page.evaluate(
      () => localStorage.length === 0 && sessionStorage.length === 0,
    ),
    "Browser persisted credentials",
  );
  await logout();
  await page
    .getByRole("button", { name: "Recover password", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill(fixture.signupEmail);
  await page
    .getByRole("button", { name: "Send recovery email", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "If the account exists" })
    .waitFor();
  await page.goto(await emailLink(fixture.signupEmail, "recovery"));
  await page.getByRole("heading", { name: "Choose a new password" }).waitFor();
  await page
    .getByLabel("New password", { exact: true })
    .fill(fixture.password + "-changed");
  await page
    .getByRole("button", { name: "Update password", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Password changed" })
    .waitFor();
  await login(fixture.signupEmail, fixture.password + "-changed");
  await logout();
  for (const role of ["owner", "admin", "agent", "viewer", "revoked"]) {
    await login(fixture.users[role].email);
    if (role === "revoked") {
      await page
        .getByText("No organization access yet.", { exact: false })
        .waitFor();
    } else {
      await page.getByText(`Your role: ${role}.`, { exact: false }).waitFor();
      ensure(
        (await page
          .getByRole("button", { name: "Create invitation", exact: true })
          .count()) === (["owner", "admin"].includes(role) ? 1 : 0),
        `Wrong management controls for ${role}`,
      );
    }
    await logout();
  }
  console.log(
    "Browser account and role checks passed with synthetic local accounts.",
  );
}
