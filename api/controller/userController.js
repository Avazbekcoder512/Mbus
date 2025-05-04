import { userModel } from "../models/user.js";

export const userPage = async (req, res) => {
  try {
    return res.render("profile", {
      layout: false,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: "Serverda ichki xatolik!",
    });
  }
};

export const userProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: "Id noto'g'ri!",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).send({
        error: "Foydalanuvchi topilmadi!",
      });
    }

    return res.status(200).send({
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: "Serverda ichki xatolik!",
    });
  }
};