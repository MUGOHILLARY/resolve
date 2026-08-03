import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log("Resolve Event");

    console.log(req.body);

    return res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to process event.",
    });

  }
});

export default router;