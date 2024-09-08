import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import vine, { errors } from "@vinejs/vine";

import { users, db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";

import { loginSchema } from "@/validators/authSchema";
import { CustomErrorReport } from "@/validators/CustomErrorReporter";

interface UserData {
  id?: number;
  name?: string;
  username?: string;
  // Additional properties
  email?: string | null;
  password?: string | null;
}
[];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    vine.errorReporter = () => new CustomErrorReport();

    const validator = vine.compile(loginSchema);
    const payload = await validator.validate(body);

    //  * Check is there any email or not
    const isUserExist = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email));

    if (isUserExist.length > 0) {
      // * Check is password correct or not
      //   const isPasswordSame = bcrypt.compareSync(
      //     payload.password,
      //     isUserExist.password!
      //   );
      const setCookies = cookies();
      const [{ id }] = isUserExist;
      console.log(id, "id");
      setCookies.set("user_id", id.toString());

      return NextResponse.json({
        status: 200,
        message: "you logged in successfully!",
      });
      //   }
      //   return NextResponse.json({
      //     status: 400,
      //     errors: {
      //       email: "Invalid credentials.",
      //     },
      //   });
    }

    return NextResponse.json({
      status: 400,
      errors: {
        email: "No account found with this email",
      },
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
