import { NextRequest, NextResponse } from "next/server";

import * as schema from "@/lib/drizzle";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

const db = drizzle(sql, { schema: schema });

export async function GET(request: NextRequest) {
  const result = await db.query.posts.findMany({
    with: {
      user_posts: {
        columns: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json({
    status: 200,
    data: result,
  });
}
