export default function handler(req, res) {
    if (req.method === "POST") {
        const {action} = req.body
        const clientIp = req.handler ["x-forwarded-for"] || req.soket.remoteAddress
        console.log(`Client IP: ${clientIp}, Action: ${action}`)
        res.status(200).json({message: "Action logged"})
    } else {
        res.setHeader("Allow" , ["POST"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}