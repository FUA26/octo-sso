import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import * as ms from "ms";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;
    console.log(reqBody);

    // Cek apakah user dengan email tersebut ada
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    // Verifikasi password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Membuat data token
    const tokenData = {
      id: user.id,
      username: user.nama,
      email: user.email,
    };

    // Membuat JWT token
    const accessToken = jwt.sign(tokenData, process.env.AUTH_JWT_SECRET!, {
      expiresIn: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(tokenData, process.env.AUTH_JWT_SECRET!, {
      expiresIn: process.env.AUTH_JWT_REFRESH_EXPIRES_IN,
    });
    // console.log(process.env.AUTH_JWT_TOKEN_EXPIRES_IN!);
    const expiresInMs = ms(process.env.AUTH_JWT_TOKEN_EXPIRES_IN!);
    // console.log(expiresInMs);
    // Menyiapkan response dengan token di cookie
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      data: {
        user: tokenData,
        token: {
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresIn: new Date().getTime() + expiresInMs,
        },
      },
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
