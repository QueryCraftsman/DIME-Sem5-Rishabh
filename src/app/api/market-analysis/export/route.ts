import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "csv";

    // 12-Month normalized dataset
    const rows = [
      ["Month", "Mock AI Tool Searches (0-100)", "Interview Prep Pain Mentions (0-100)", "Velocity Note"],
      ["Oct 2025", "18", "32", "Baseline hiring loop volume"],
      ["Nov 2025", "24", "37", "Q4 fall prep increase"],
      ["Dec 2025", "30", "42", "Year-end career changes"],
      ["Jan 2026", "42", "50", "New year hiring surges"],
      ["Feb 2026", "52", "58", "Spring loop announcements"],
      ["Mar 2026", "62", "65", "Mid-level market competition"],
      ["Apr 2026", "70", "72", "Staff loop complexity escalation"],
      ["May 2026", "77", "78", "Velocity inflection: +42% spike"],
      ["Jun 2026", "82", "84", "Summer campus and senior hiring"],
      ["Jul 2026", "85", "89", "High anxiety search peak"],
      ["Aug 2026", "87", "94", "Unscripted simulation demand"],
      ["Sep 2026", "88", "97", "Peak watermark: 88/100 demand"],
    ];

    if (format === "json") {
      const jsonRecords = rows.slice(1).map((r) => ({
        month: r[0],
        mockToolSearches: Number(r[1]),
        painMentions: Number(r[2]),
        note: r[3],
      }));
      return NextResponse.json(jsonRecords);
    }

    const csvContent = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="dime-market-signals.csv"',
      },
    });
  } catch (error: unknown) {
    console.error("EXPORT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
