import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { attempt } = body;

  const PASSWORD_BENAR = "iloveyou";
  const THE_FLAG = "3mu_s3mu4_fL49nYa}";

  if (!attempt) {
    return NextResponse.json({ success: false, message: "Tidak ada suara terdeteksi" });
  }

  if (attempt.toLowerCase() === PASSWORD_BENAR) {
    return NextResponse.json({ 
      success: true, 
      flag: THE_FLAG 
    });
  } else {
    return NextResponse.json({ 
      success: false, 
      message: "Password salah" 
    });
  }
}