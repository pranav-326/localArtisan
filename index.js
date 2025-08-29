import { GoogleGenAI } from "@google/genai"
import express from "express"
import multer from "multer"
const upload = multer();
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
function imageToBase64(imageFile) {
    return imageFile.buffer.toString("base64");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY|| "AIzaSyBOfE4lP3bFNxp0BEW4Vy3WDDQy-ykHJGA" });
const storyModel = 'gemini-2.5-flash';
var story=null;
app.get("/", async (req, res) => {
    res.render("index.ejs", { "story": story });
});
app.post("/generate", upload.single("image"), async (req, res) => {
    const prompt = `You are an expert storyteller for artisanal products. An artisan has provided an image of their product and a short description. Your task is to write a short, captivating story about this product in about 150 words. The story should evoke emotion, highlight the craftsmanship, and appeal to a broad audience. Make it sound authentic and personal, as if the artisan themself is speaking. Here is the product description: ${req.body.prompt}`;
    const image = req.file;
    let imagePart = null;
    if (image) {
        const base64String = imageToBase64(image);
        imagePart = {
            inlineData: {
                mimeType: image.mimetype,
                data: base64String
            }
        };
    }
    const textPart = { text: prompt };
    const parts = imagePart ? [imagePart, textPart] : [textPart];
    try {
        const response = await ai.models.generateContent({
            model: storyModel,
            contents: { parts },
        });
        story = response.text;
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error generating story: " + error.message);
    }
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});