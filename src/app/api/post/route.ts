import { NextRequest, NextResponse } from "next/server";
import vine, { errors } from "@vinejs/vine";
import * as schema from "@/lib/drizzle";
import { CustomErrorReport } from "@/validators/CustomErrorReporter";
import { postSchema } from "@/validators/postSchema";
import { getServerSession } from "next-auth";

import { imagevalidator } from "@/validators/imageValidator";
import { writeFile } from "fs/promises";
import { getRandomNumber } from "@/lib/utils";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { join } from "path";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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
interface UserUploadImg {
  arrayBuffer():
    | WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>
    | PromiseLike<WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>>;
  name: string;
  size: number;
}
interface PayloadData {
  content: string | null | undefined;
}

interface Post {
  id: number;
  user_id: number;
  content: string;
  image?: string | null;
  created_at: Date;
}

// Update the type definition to include 'content'
interface PostWithContent extends Post {
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // const session: CustomSession | null = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ status: 401, message: "Un-Authorized" });
    // }
    const formData = await request.formData();
    const data = {
      content: formData.get("content"),
      image: "",
    };
    vine.errorReporter = () => new CustomErrorReport();
    const validator = vine.compile(postSchema);
    const payload: PayloadData = await validator.validate(data);

    const image = formData.get("image") as UserUploadImg | null;
    console.log("🚀 ~ file: route.ts:65 ~ POST ~ image:", image);
    // * IF image exist
    if (image) {
      const isImageNotValid = imagevalidator(image?.name, image?.size);
      console.log(
        "🚀 ~ file: route.ts:68 ~ POST ~ isImageNotValid:",
        isImageNotValid
      );
      if (isImageNotValid) {
        return NextResponse.json({
          status: 400,
          errors: {
            content: isImageNotValid,
          },
        });
      }

      // * Upload image if all good
      try {
        const buffer = Buffer.from(await image!.arrayBuffer());
        const uploadDir = join(process.cwd(), "public", "/uploads");
        const uniqueNmae = Date.now() + "_" + getRandomNumber(1, 999999);
        const imgExt = image?.name.split(".");
        const filename = uniqueNmae + "." + imgExt?.[1];
        await writeFile(`${uploadDir}/${filename}`, buffer);
        data.image = filename;
      } catch (error) {
        return NextResponse.json({
          status: 500,
          message: "Something went wrong.Please try again later.",
        });
      }
    }
    const userID = cookies().get("user_id")?.value;
    const userIdDb = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, 1));

    // * create post in DB
    await db.insert(schema.posts).values({
      content: payload.content,
      image: data.image ?? null,
      user_id: userID?.toString(),
      created_at: null,
    } as unknown as PostWithContent);

    return NextResponse.json({
      status: 200,
      message: "Post created successfully!",
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { status: 400, errors: error.messages },
        { status: 200 }
      );
    }
  }
}
