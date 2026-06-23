import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ImagePlus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  ChefHat,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import "./WriteRecipePage.css";

export const WriteRecipePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      coverImageUrl: "",
      categoryId: "",
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      servings: 1,
      difficulty: 1,
      ingredients: [{ name: "", amount: "", unit: "", note: "" }],
      steps: [{ content: "", imageUrl: "" }],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/api/features/categories");
        setCategories(res.data);
      } catch (error) {
        toast.error("Không thể tải danh mục món ăn!");
      }
    };
    fetchCategories();
  }, []);

  // BẢN FIX LỖI 1: Nhận diện Textarea
  const handleKeyDown = (e) => {
    // Nếu bấm Enter ở ô input thường -> Chặn (tránh submit bậy)
    // Nhưng nếu đang ở trong <textarea> (nhập bước làm) -> Phải cho phép xuống dòng!
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const loadingToast = toast.loading("Đang tải ảnh lên...");

    try {
      const res = await apiClient.post(
        "/api/features/uploads/image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setValue(fieldName, res.data.url);
      toast.success("Tải ảnh thành công!", { id: loadingToast });
    } catch (error) {
      toast.error("Lỗi tải ảnh: Kích thước quá lớn hoặc sai định dạng", {
        id: loadingToast,
      });
    }
  };

  const handleNextStep = async () => {
    let isStepValid = false;

    if (currentStep === 1) {
      isStepValid = await trigger(["title"]);
      if (!isStepValid) {
        toast.error("Tên món ăn là bắt buộc. Đừng bỏ trống nhé!");
        return;
      }
    }

    if (currentStep === 2) {
      // BẢN FIX LOGIC 2: Kiểm tra xem có ít nhất 1 nguyên liệu hợp lệ không
      const currentIngredients = watch("ingredients");
      const hasValidIngredient = currentIngredients.some(
        (ing) => ing.name && ing.name.trim() !== "",
      );

      if (!hasValidIngredient) {
        toast.error(
          "Món ăn thì phải có nguyên liệu chứ! Vui lòng nhập ít nhất 1 món.",
        );
        return;
      }
      isStepValid = true;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      "Đang lưu công thức vào bếp... Vui lòng chờ!",
    );

    try {
      const res = await apiClient.post("/api/features/recipes", data);
      toast.success("Tuyệt vời! Công thức đã được đăng.", {
        id: loadingToast,
      });

      setTimeout(() => {
        // KHẮC PHỤC TẠI ĐÂY: Thay res.data.recipeId bằng res.data.slug
        navigate(`/recipe/${res.data.slug}`);
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi lưu vào Database!",
        {
          id: loadingToast,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverImageUrl = watch("coverImageUrl");

  return (
    <div className="write-recipe-container">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 3000 }}
      />

      <div className="stepper-header">
        <div className={`step-item ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-circle">
            {currentStep > 1 ? <Check size={16} /> : 1}
          </div>
          <span>Tổng quan</span>
        </div>
        <div className={`step-line ${currentStep >= 2 ? "active" : ""}`}></div>
        <div className={`step-item ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-circle">
            {currentStep > 2 ? <Check size={16} /> : 2}
          </div>
          <span>Nguyên liệu</span>
        </div>
        <div className={`step-line ${currentStep >= 3 ? "active" : ""}`}></div>
        <div className={`step-item ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-circle">3</div>
          <span>Cách làm</span>
        </div>
      </div>

      {/* BẢN FIX LỖI 3: Chặn onSubmit mặc định của Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        className="wizard-form-body"
      >
        {currentStep === 1 && (
          <div className="step-content animation-slide-up">
            <h2 className="step-title">Bước 1: Giới thiệu món ăn của bạn</h2>

            <div className="cover-upload-zone">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="cover-preview"
                />
              ) : (
                <div className="upload-placeholder">
                  <ImagePlus size={40} color="var(--color-text-hint)" />
                  <p>Tải ảnh bìa (JPG, PNG)</p>
                </div>
              )}
              <input
                type="file"
                className="file-input-hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "coverImageUrl")}
              />
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  Tên món ăn <span className="required">*</span>
                </label>
                <input
                  {...register("title", { required: true })}
                  placeholder="Ví dụ: Phở bò gia truyền..."
                  className="base-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Danh mục</label>
                <select {...register("categoryId")} className="base-input">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Khẩu phần (Người)</label>
                <input
                  type="number"
                  {...register("servings")}
                  min="1"
                  className="base-input"
                />
              </div>
            </div>

            <div className="form-row three-cols">
              <div className="form-group">
                <label>Chuẩn bị (Phút)</label>
                <input
                  type="number"
                  {...register("prepTimeMinutes")}
                  min="0"
                  className="base-input"
                />
              </div>
              <div className="form-group">
                <label>Chế biến (Phút)</label>
                <input
                  type="number"
                  {...register("cookTimeMinutes")}
                  min="0"
                  className="base-input"
                />
              </div>
              <div className="form-group">
                <label>Độ khó</label>
                <select {...register("difficulty")} className="base-input">
                  <option value="1">Dễ</option>
                  <option value="2">Trung bình</option>
                  <option value="3">Khó</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content animation-slide-up">
            <h2 className="step-title">Bước 2: Nguyên liệu cần có</h2>
            <p className="step-desc">
              Liệt kê chi tiết để mọi người dễ dàng đi chợ nhé.
            </p>

            <div className="dynamic-list">
              {ingredientFields.map((item, index) => (
                <div key={item.id} className="dynamic-row">
                  <div className="drag-handle">
                    <ChefHat size={16} />
                  </div>
                  <input
                    {...register(`ingredients.${index}.name`)}
                    placeholder="Tên (VD: Thịt heo)"
                    className="base-input flex-2"
                  />
                  <input
                    {...register(`ingredients.${index}.amount`)}
                    placeholder="Lượng (VD: 500)"
                    className="base-input flex-1"
                  />
                  <input
                    {...register(`ingredients.${index}.unit`)}
                    placeholder="Đơn vị (VD: gram)"
                    className="base-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="btn-icon-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-add-dashed"
              onClick={() =>
                appendIngredient({ name: "", amount: "", unit: "", note: "" })
              }
            >
              <Plus size={16} /> Thêm nguyên liệu
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content animation-slide-up">
            <h2 className="step-title">Bước 3: Hướng dẫn thực hiện</h2>

            <div className="dynamic-list steps-list">
              {stepFields.map((item, index) => {
                const currentStepImageUrl = watch(`steps.${index}.imageUrl`);
                return (
                  <div key={item.id} className="step-dynamic-card">
                    <div className="step-card-header">
                      <h3>Bước {index + 1}</h3>
                      {stepFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="btn-icon-danger-text"
                        >
                          Xóa bước này
                        </button>
                      )}
                    </div>

                    <textarea
                      {...register(`steps.${index}.content`)}
                      placeholder="Mô tả chi tiết bước làm..."
                      className="base-textarea"
                      rows="3"
                    ></textarea>

                    <div className="step-image-upload">
                      {currentStepImageUrl ? (
                        <div className="step-img-preview-box">
                          <img
                            src={currentStepImageUrl}
                            alt={`Bước ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="btn-change-img"
                            onClick={() =>
                              setValue(`steps.${index}.imageUrl`, "")
                            }
                          >
                            Đổi ảnh
                          </button>
                        </div>
                      ) : (
                        <div className="step-upload-placeholder">
                          <ImagePlus size={20} /> Thêm ảnh bước {index + 1}
                          <input
                            type="file"
                            className="file-input-hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, `steps.${index}.imageUrl`)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-add-dashed"
              onClick={() => appendStep({ content: "", imageUrl: "" })}
            >
              <Plus size={16} /> Thêm bước mới
            </button>
          </div>
        )}

        <div className="wizard-footer">
          <button
            type="button"
            className={`btn-prev ${currentStep === 1 ? "hidden" : ""}`}
            onClick={prevStep}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          {currentStep < 3 ? (
            <button type="button" className="btn-next" onClick={handleNextStep}>
              Tiếp tục <ArrowRight size={16} />
            </button>
          ) : (
            // BẢN FIX LỖI 4: Đổi type sang button và gọi API thủ công bằng onClick
            <button
              type="button"
              className="btn-submit-recipe"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Đang lưu..." : "Đăng công thức ngay!"}{" "}
              <ChefHat size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
