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

  await login(fixture.users.owner.email);
  await page
    .getByLabel("Staff email", { exact: true })
    .fill(fixture.users.invitee.email);
  await page
    .getByRole("combobox", { name: "Staff role", exact: true })
    .selectOption("viewer");
  await page
    .getByRole("button", { name: "Create invitation", exact: true })
    .click();
  const tokenField = page.getByRole("textbox", {
    name: "Shareable invitation token",
    exact: true,
  });
  await tokenField.waitFor();
  const token = await tokenField.inputValue();
  await logout();
  await login(fixture.users.invitee.email);
  await page.getByLabel("Invitation token", { exact: true }).fill(token);
  await page
    .getByRole("button", { name: "Accept invitation", exact: true })
    .click();
  await page.getByText("Your role: viewer.", { exact: false }).waitFor();
  ensure(
    (await page
      .getByRole("button", { name: "Create invitation", exact: true })
      .count()) === 0,
    "Viewer received manager controls",
  );
  await logout();
  await login(fixture.users.owner.email);
  const member = page
    .getByRole("listitem")
    .filter({ hasText: fixture.users.invitee.id });
  await member
    .getByRole("button", { name: "Revoke access", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Access revoked" })
    .waitFor();
  await logout();
  await login(fixture.users.invitee.email);
  await page
    .getByText("No organization access yet.", { exact: false })
    .waitFor();
  await logout();
  await login(fixture.users.owner.email);
  await page.setViewportSize({ width: 390, height: 844 });
  ensure(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Mobile layout overflows horizontally",
  );
  await page.screenshot({
    path: "output/playwright/identity-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: "output/playwright/identity-desktop.png",
    fullPage: true,
  });
  await logout();
  console.log(
    "Browser invitation acceptance/revocation and mobile checks passed. Synthetic local accounts only.",
  );
}
