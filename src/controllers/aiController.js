import { groq } from "../utils.js/groqClient.js";


export const completion = async (req, res) => {

    try {
        const { text } = req.body;

        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: "system", content: "generate a short creative caption" },
                { role: "user", content: text }
            ]
        })

        console.log("response", response);
        const caption = response.choices[0].message?.content;
        return res.json({ caption })



    } catch (error) {
        console.log(err);
        res.status(500).json({ error: "AI Error" });
    }
}