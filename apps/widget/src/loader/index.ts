const script = document.currentScript;
if (
  script instanceof HTMLScriptElement &&
  !document.getElementById("sales-support-widget")
) {
  const frame = document.createElement("iframe");
  frame.id = "sales-support-widget";
  frame.title = "Customer support";
  frame.src = new URL("./index.html", script.src).href;
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
  document.body.append(frame);
}
