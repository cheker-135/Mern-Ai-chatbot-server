import { Router } from "express";
import { getAllUsers, userSignup, userLogin, verifyUser, userLogout,deleteUser,makeAdmin } from "../controllers/user-controllers.js";
//import { signupValidator, validate, loginValidator } from "../utils/validators.js";
import { verifyToken } from '../utils/token-manager.js';

const userRoutes = Router();

userRoutes.get("/all-users", getAllUsers);
userRoutes.post("/signup", userSignup);
userRoutes.post("/login",  userLogin);
userRoutes.get("/auth-status", verifyToken ,verifyUser);
userRoutes.get("/logout", verifyToken , userLogout);
userRoutes.post("/admin/make-admin", makeAdmin);
userRoutes.delete("/delete", deleteUser);

export default userRoutes;
