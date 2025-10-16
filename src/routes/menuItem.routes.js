
const express = require("express");
const { validateBody } = require("../middlewares/validateBody");
const auth = require("../middlewares/auth");
const { createMenuItemSchema, updateMenuItemSchema } = require("../validators/menuItem.validator");
const { listMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem
 } = require("../controllers/menu.controller");

const router = express.Router();



router.get("/", listMenuItems);
router.get("/item/:id", getMenuItemById);
router.post("/add", auth(["admin"]), validateBody(createMenuItemSchema),
    createMenuItem
);
router.patch("/update/:id", auth(["admin"]), validateBody(updateMenuItemSchema), updateMenuItem);
router.delete("/delete/:id", auth(["admin"]), deleteMenuItem);

module.exports = router;
