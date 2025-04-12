export default function handler(req, res) {
    if (req.method === "POST") {
        const { email, password } = req.body;

      // TODO: Replace this with actual DB check (MySQL or Firebase etc.)
        if (email === "admin@example.com" && password === "admin123") {
            res.status(200).json({ success: true, message: "Login successful" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}