import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");
    let image: Buffer | null = null;

    if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      image = Buffer.from(arrayBuffer);
    }

    if (image == null) {
      return NextResponse.json(
        { message: "Missing or invalid image" },
        { status: 400 }
      );
    }

    const base64 = image.toString("base64");
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      max_completion_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Are there 3 people in this image? Only respond with yes or no." },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ result: content });
  } catch (error){
    console.error(error);
    return NextResponse.json(
      { message: "Detection failed" },
      { status: 500 }
    );
  }
}
