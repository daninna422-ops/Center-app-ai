export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  return res.status(200).json({
    reply: "Sannu! Backend ɗin Center App AI yana aiki lafiya. ✅"
  });
}
