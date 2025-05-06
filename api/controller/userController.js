import { matchedData, validationResult } from "express-validator";
import { userModel } from "../models/user.js";
import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv'
config()

const supabase = createClient(
  process.env.Supabase_Url,
  process.env.Anon_key,
);

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

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: "Id noto'g'ri!",
      });
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({
        error: errors.array().map(error => error.msg)
      })
    }

    const data = matchedData(req)

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).send({
        error: "Foydalanuvchi topilmadi!"
      })
    }

    const updatedUser = {
      first_Name: data.first_Name || user.first_Name,
      last_Name: data.last_Name || user.last_Name,
      phoneNumber: data.phoneNumber || user.phoneNumber,
      bank_card: data.bank_card || user.bank_card,
      expiryDate: data.expiryDate || user.expiryDate,
      passport: data.passport || user.passport
    }

    await userModel.findByIdAndUpdate(id, updatedUser)

    return res.status(201).send({
      message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi!"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: "Serverda ichki xatolik!",
    });
  }
}

export const profileImageUpdate = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: "Id noto'g'ri!",
      });
    }

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).send({
        error: "Foydalanuvchi topilmadi!"
      })
    }

    let fileUrl = user.image;

    if (!req.file) {
      return res.status(400).send({
        error: "Iltimos rasmni fayl shaklida yuboring!"
      })
    }

    try {
      const maxFileSize = 5 * 1024 * 1024;
      if (req.file.size > maxFileSize) {
        return res.status(400).send({
          error: "Rasm hajmi 5 MB dan oshmasligi kerak!",
        });
      }

      if (fileUrl) {
        const filePath = fileUrl.replace(
          `${supabase.storageUrl}/object/public/mbus_bucket/`,
          ""
        );

        // Faylning mavjudligini tekshirish
        const { data: fileExists, error: checkError } = await supabase.storage
          .from("mbus_bucket")
          .list("", { prefix: filePath });

        if (checkError) {
          console.error(
            `Fayl mavjudligini tekshirishda xatolik: ${checkError.message}`
          );
        } else if (fileExists && fileExists.length > 0) {
          // Faylni o‘chirish
          const { error: deleteError } = await supabase.storage
            .from("mbus_bucket")
            .remove([filePath]);

          if (deleteError) {
            throw new Error(
              `Faylni o'chirishda xatolik: ${deleteError.message}`
            );
          }
        }
      }

      // Yangi faylni yuklash
      const { buffer, originalname } = req.file;
      const fileName = `userImage/${Date.now()}-${originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("mbus_bucket")
        .upload(fileName, buffer, {
          cacheControl: "3600",
          upsert: true,
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        throw new Error(`Fayl yuklanmadi: ${uploadError.message}`);
      }

      fileUrl = `${supabase.storageUrl}/object/public/mbus_bucket/${fileName}`;

      await userModel.findByIdAndUpdate(id, { image: fileUrl })

      return res.status(201).send({
        message: "Foydalanuvchi rasmi yangilandi!"
      })
    } catch (err) {
      console.error(`Faylni yangilashda xatolik: ${err.message}`);
      throw new Error(
        "Yangi faylni yuklash yoki eski faylni o‘chirishda muammo!"
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: "Serverda ichki xatolik!",
    });
  }
}

export const profileImageDelete = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: "Id noto'g'ri!",
      });
    }

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).send({
        error: "Foydalanuvchi topilmadi!"
      })
    }

    let fileUrl = user.image;

    if (fileUrl) {
      const filePath = fileUrl.replace(
        `${supabase.storageUrl}/object/public/mbus_bucket/`,
        ""
      );

      // Faylning mavjudligini tekshirish
      const { data: fileExists, error: checkError } = await supabase.storage
        .from("mbus_bucket")
        .list("", { prefix: filePath });

      if (checkError) {
        console.error(
          `Fayl mavjudligini tekshirishda xatolik: ${checkError.message}`
        );
      } else if (fileExists && fileExists.length > 0) {
        // Faylni o‘chirish
        const { error: deleteError } = await supabase.storage
          .from("mbus_bucket")
          .remove([filePath]);

        if (deleteError) {
          throw new Error(
            `Faylni o'chirishda xatolik: ${deleteError.message}`
          );
        }
      }
    }

    await userModel.findByIdAndUpdate(id, { $unset: { image: '' } }, { new: true })

    return res.status(200).send({
      message: "Foydalanuvchi rasmi muvaffaiyatli o'chirildi!"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: "Serverda ichki xatolik!",
    });
  }
}