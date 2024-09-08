import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import vine, { errors } from "@vinejs/vine";

import { users, db } from "@/lib/drizzle";

import { registerSchema } from "@/validators/authSchema";
import { CustomErrorReport } from "@/validators/CustomErrorReporter";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const response = await request.json();
    vine.errorReporter = () => new CustomErrorReport();

    const validator = vine.compile(registerSchema);
    const payload = await validator.validate(response);

    const salt = bcrypt.genSaltSync(10);
    payload.password = bcrypt.hashSync(payload.password, salt);

    // * Check email if it already exist
    const emailExist = await db
      .select()
      .from(users)
      .where(eq(users.email, response.email));

    if (emailExist.length > 0) {
      return NextResponse.json({
        status: 400,
        errors: {
          email: "Email already taken. please use another email.",
        },
      });
    }

    // * Check username if it already exist

    // const isUsernameExist = await db
    //   .select()
    //   .from(users)
    //   .where(eq(users.username, response.username));

    // if (isUsernameExist) {
    //   return NextResponse.json({
    //     status: 400,
    //     errors: {
    //       username: "Username already taken. please use another email.",
    //     },
    //   });
    // }

    await db.insert(users).values({
      name: response.name,
      username: response.username,
      email: response.email,
      password: response.password,
    });

    return NextResponse.json({
      status: 200,
      message: "Account created successfully.Please login into your account!",
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      console.log(error.messages);
      return NextResponse.json({ status: 400, error: error.messages });
    }
    // Handle other types of errors here
    return NextResponse.json({
      status: 500,
      error: "An unexpected error occurred.",
    });
  }
}
