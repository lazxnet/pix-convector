export default function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  
    const { action } = req.body
    // Get IP address safely with fallbacks
    const forwarded = req.headers["x-forwarded-for"]
    const ip = forwarded ? forwarded.split(/, /)[0] : req.connection?.remoteAddress || "unknown"
  
    console.log(`Client IP: ${ip}, Action: ${action}`)
  
    return res.status(200).json({
      message: "Action logged",
      ip: ip,
    })
  }
  
  