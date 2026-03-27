import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * Data Export API for admin and due diligence.
 * Exports any approved table as paginated JSON.
 * Protected by bearer token. Uses service role to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (expectedToken && token !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table  = searchParams.get("table");
  const limit  = Math.min(Number(searchParams.get("limit")  || "1000"), 5000);
  const offset = Number(searchParams.get("offset") || "0");

  const allowedTables = Object.values(TABLES);

  if (!table || !allowedTables.includes(table as typeof TABLES[keyof typeof TABLES])) {
    return Response.json(
      { error: `Invalid table. Allowed: ${allowedTables.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const db = createServerClient();

    const { data, error, count } = await db
      .from(table)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      table,
      totalRows: count,
      returned:  data?.length || 0,
      offset,
      limit,
      data,
    });
  } catch {
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
