import { NextRequest, NextResponse } from "next/server";
import { vl } from 'moondream'

const model = new vl({ apiKey: 'YOUR_API_KEY' });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");
    let image: Buffer | null = null;

    if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      image = Buffer.from(arrayBuffer);
    }

    if (image == null){
        return NextResponse.json(
          { message: "Missing or invalid image" },
          { status: 400 }
        );
    }

    const result = await model.query({
      image: image,
      question: 'What is in this image?'
    });
    console.log(result.answer);

    return NextResponse.json({
      result: "Moondream VLM integration: pass this image to your Moondream API and return the detection result here.",
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Detection failed" },
      { status: 500 }
    );
  }
}
