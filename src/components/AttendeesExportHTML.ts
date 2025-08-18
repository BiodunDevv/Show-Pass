export interface AttendeeRow {
  index: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketType: string;
  status: "checked" | "pending" | string;
  checkedInAt?: string;
}

export interface AttendeesExportContext {
  event?: {
    title?: string;
    startDate?: string;
    endDate?: string;
    venue?: { name?: string; address?: string; city?: string; state?: string };
  } | null;
  attendees: AttendeeRow[];
  statusSummary?: {
    total?: number;
    used?: number;
    pending?: number;
    confirmed?: number;
  } | null;
  appliedFilter?: string;
  search?: string;
  generatedAt?: Date;
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString() : "-";

export function buildAttendeesHTML(ctx: AttendeesExportContext): string {
  const title = ctx.event?.title || "Event Attendees";
  const start = ctx.event?.startDate ? formatDate(ctx.event?.startDate) : "-";
  const venue = ctx.event?.venue?.name || "-";
  const total = ctx.statusSummary?.total ?? ctx.attendees.length;
  const used = ctx.statusSummary?.used ?? 0;
  const pending = ctx.statusSummary?.pending ?? Math.max(0, total - used);
  const generated = (ctx.generatedAt || new Date()).toLocaleString();
  const appliedFilter = ctx.appliedFilter || "all";
  const search = ctx.search || "";

  const rowsHtml = ctx.attendees
    .map((a) => {
      const badgeClass =
        a.status === "checked"
          ? "bg-green-100 text-green-800"
          : a.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-slate-200 text-slate-800";
      const statusLabel =
        a.status === "checked"
          ? "Checked In"
          : a.status === "pending"
          ? "Pending"
          : a.status;
      return `<tr>
        <td class="text-right pr-2 text-slate-600">${a.index}</td>
        <td>
          <div class="font-medium text-slate-900">${escapeHtml(
            a.firstName
          )} ${escapeHtml(a.lastName)}</div>
          <div class="text-xs text-slate-600">${escapeHtml(a.email)}</div>
        </td>
        <td>${escapeHtml(a.phone || "-")}</td>
        <td>${escapeHtml(a.ticketType || "-")}</td>
        <td><span class="inline-block px-2 py-0.5 rounded-full text-xs ${badgeClass}">${escapeHtml(
        statusLabel
      )}</span></td>
        <td>${a.checkedInAt ? escapeHtml(formatDate(a.checkedInAt)) : "-"}</td>
      </tr>`;
    })
    .join("\n");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — Attendees Export</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 0; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 960px; margin: 24px auto; background: #0b1220; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { position: relative; padding: 24px; background: linear-gradient(135deg, rgba(147,51,234,0.15), rgba(59,130,246,0.12)); border-bottom: 1px solid #1f2a44; }
    .h-title { margin: 0; font-size: 20px; font-weight: 700; color: #f8fafc; }
    .h-sub { margin: 8px 0 0; font-size: 12px; color: #cbd5e1; }
    .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .card { background: #0e1628; border: 1px solid #21314d; border-radius: 12px; padding: 12px; }
    .card .label { font-size: 11px; color: #93a3b8; margin: 0 0 4px; }
    .card .value { font-size: 18px; font-weight: 700; color: #f1f5f9; }
    .filters { display: flex; gap: 12px; margin-top: 12px; font-size: 12px; color: #cbd5e1; }
    .content { padding: 16px 24px 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #1e293b; }
    th { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: #93a3b8; background: #0f1a2e; }
    td { font-size: 14px; color: #e2e8f0; }
    .text-right { text-align: right; }
    .pr-2 { padding-right: 8px; }
    .text-slate-600 { color: #94a3b8; }
    .text-slate-900 { color: #0f172a; }
    .font-medium { font-weight: 600; }
    .text-xs { font-size: 12px; }
    .inline-block { display: inline-block; }
    .px-2 { padding-left: 8px; padding-right: 8px; }
    .py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
    .rounded-full { border-radius: 9999px; }
    .bg-green-100 { background: #dcfce7; }
    .text-green-800 { color: #166534; }
    .bg-yellow-100 { background: #fef9c3; }
    .text-yellow-800 { color: #854d0e; }
    .bg-slate-200 { background: #e2e8f0; }
    .text-slate-800 { color: #1e293b; }
    @media print {
      body { background: #fff; color: #000; }
      .container { border: none; }
      .header { background: #fff; border: none; }
      .content { padding-top: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="h-title">${escapeHtml(title)} — Attendees</h1>
      <p class="h-sub">Start: ${escapeHtml(start)} • Venue: ${escapeHtml(
    venue
  )} • Generated: ${escapeHtml(generated)}</p>
      <div class="summary">
        <div class="card"><p class="label">Total</p><p class="value">${total}</p></div>
        <div class="card"><p class="label">Checked In</p><p class="value">${used}</p></div>
        <div class="card"><p class="label">Pending</p><p class="value">${pending}</p></div>
      </div>
      <div class="filters">
        <div>Filter: ${escapeHtml(appliedFilter)}</div>
        <div>Search: ${escapeHtml(search || "-")}</div>
      </div>
    </div>
    <div class="content">
      <table>
        <thead>
          <tr>
            <th class="text-right">#</th>
            <th>Attendee</th>
            <th>Phone</th>
            <th>Ticket Type</th>
            <th>Status</th>
            <th>Checked In At</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
