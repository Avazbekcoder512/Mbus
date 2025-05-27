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
      error: req.__('SERVER_ERROR')
    });
  }
};

export const userPageRu = async (req, res) => {
  try {
    return res.render("profileRu", {
      layout: false,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: req.__('SERVER_ERROR')
    });
  }
};

export const userPageEn = async (req, res) => {
  try {
    return res.render("profileEn", {
      layout: false,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: req.__('SERVER_ERROR')
    });
  }
};

export const userProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: req.__('INVALID_ID')
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).send({
        error: req.__('USER_NOT_FOUND')
      });
    }

    return res.status(200).send({
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: req.__('SERVER_ERROR')
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: req.__('INVALID_ID')
      });
    }

    console.log(req.body);
    

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({
        error: errors.array().map(error => req.__(error.msg))
      })
    }

    const data = matchedData(req)

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).send({
        error: req.__('USER_NOT_FOUND')
      })
    }

    const updatedUser = {
      first_Name: data.first_Name || user.first_Name,
      last_Name: data.last_Name || user.last_Name,
      phoneNumber: data.phoneNumber || user.phoneNumber,
      bank_card: data.bank_card || user.bank_card,
      expiryDate: data.expiryDate || user.expiryDate,
      passport: data.passport || user.passport,
      gender: data.gender || user.gender
    }

    await userModel.findByIdAndUpdate(id, updatedUser)

    return res.status(201).send({
      message: req.__('USER_UPDATE_SUCCESS')
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: req.__('SERVER_ERROR')
    });
  }
}

export const profileImageUpdate = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: req.__('INVALID_ID')
      });
    }

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).send({
        error: req.__('USER_NOT_FOUND')
      })
    }

    let fileUrl = user.image;

    if (!req.file) {
      return res.status(400).send({
        error: req.__('INVALID_FILE')
      })
    }

    try {
      const maxFileSize = 5 * 1024 * 1024;
      if (req.file.size > maxFileSize) {
        return res.status(400).send({
          error: req.__('FILE_SIZE')
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
        message: req.__('IMAGE_UPDATE')
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
       error: req.__('SERVER_ERROR')
    });
  }
}

export const profileImageDelete = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        error: req.__('INVALID_ID')
      });
    }

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).send({
        error: req.__('USER_NOT_FOUND')
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
      message: req.__('DELETE_IMAGE_SUCCESS')
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: req.__('SERVER_ERROR')
    });
  }
}