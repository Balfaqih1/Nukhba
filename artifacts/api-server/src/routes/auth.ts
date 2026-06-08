import { Router } from "express";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
    username: string;
  }
}

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صالحة" });
    return;
  }

  const { username, password } = parsed.data;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    req.log.error("ADMIN_USERNAME or ADMIN_PASSWORD not set");
    res.status(500).json({ error: "خطأ في إعداد الخادم" });
    return;
  }

  if (username === adminUsername && password === adminPassword) {
    req.session.authenticated = true;
    req.session.username = username;
    res.json({ authenticated: true, username });
  } else {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });
});

router.get("/auth/me", (req, res) => {
  if (req.session.authenticated) {
    res.json({ authenticated: true, username: req.session.username ?? "" });
  } else {
    res.status(401).json({ error: "غير مصادق عليه" });
  }
});

export default router;
