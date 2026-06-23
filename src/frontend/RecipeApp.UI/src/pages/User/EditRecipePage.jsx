import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ImagePlus, Plus, Trash2, Save, X, ChefHat } from "lucide-react";
import apiClient from "../../services/apiClient";
import "./EditRecipePage.css";

export const EditRecipePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [recipeId, setRecipeId] = useState(null); // Lưu ID để gọi API PUT

  const { register, control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      coverImageUrl: "",
      categoryId: "",
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      servings: 1,
      difficulty: 1,
      ingredients: [],
      steps: [],
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

  // Tải Danh mục và Dữ liệu Công thức cùng lúc
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, recipeRes] = await Promise.all([
          apiClient.get("/api/features/categories"),
          apiClient.get(`/api/features/recipes/${slug}`),
        ]);

        setCategories(categoriesRes.data);

        const data = recipeRes.data;
        setRecipeId(data.id); // Lưu lại ID

        // HÀM RESET: Tự động đổ toàn bộ dữ liệu từ BE vào Form
        reset({
          title: data.title,
          description: data.description || "",
          coverImageUrl: data.coverImageUrl || "",
          categoryId: data.categoryId || "",
          prepTimeMinutes: data.prepTimeMinutes,
          cookTimeMinutes: data.cookTimeMinutes,
          servings: data.servings,
          difficulty: data.difficulty,
          // Map lại mảng nguyên liệu và cách làm
          ingredients: data.ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit || "",
            note: ing.note || "",
          })),
          steps: data.steps.map((step) => ({
            content: step.content,
            imageUrl: step.imageUrl || "",
          })),
        });
      } catch (error) {
        toast.error("Không thể tải dữ liệu công thức!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug, reset]);

  const handleKeyDown = (e) => {
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
      toast.error("Lỗi tải ảnh. Vui lòng thử lại.", { id: loadingToast });
    }
  };

  // HÀM XỬ LÝ UPDATE GỌI API PUT
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang cập nhật công thức...");

    try {
      // Gọi API PUT kèm theo recipeId
      await apiClient.put(`/api/features/recipes/${recipeId}`, data);
      toast.success("Cập nhật thành công!", { id: loadingToast });

      // Cập nhật xong chuyển người dùng về trang chi tiết xem thành quả
      setTimeout(() => navigate(`/recipe/${slug}`), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật!", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverImageUrl = watch("coverImageUrl");

  if (isLoading) return <div className="edit-loading">Đang tải căn bếp...</div>;

  return (
    <div className="edit-recipe-container">
      <Toaster position="top-center" />

      <div className="edit-header">
        <h1>Chỉnh sửa công thức</h1>
        <p>Cập nhật những thay đổi để món ăn hoàn hảo hơn.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className="edit-form-body"
      >
        {/* KHỐI 1: THÔNG TIN TỔNG QUAN */}
        <section className="edit-section">
          <h2 className="section-title">1. Thông tin tổng quan</h2>

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
                <p>Tải ảnh bìa mới (Tùy chọn)</p>
              </div>
            )}
            <input
              type="file"
              className="file-input-hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "coverImageUrl")}
            />
          </div>

          <div className="form-group full-width">
            <label>
              Tên món ăn <span className="required">*</span>
            </label>
            <input
              {...register("title", { required: true })}
              className="base-input"
            />
          </div>

          <div className="form-row three-cols">
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
          </div>
        </section>

        {/* KHỐI 2: NGUYÊN LIỆU */}
        <section className="edit-section">
          <h2 className="section-title">2. Nguyên liệu</h2>
          <div className="dynamic-list">
            {ingredientFields.map((item, index) => (
              <div key={item.id} className="dynamic-row">
                <div className="drag-handle">
                  <ChefHat size={16} />
                </div>
                <input
                  {...register(`ingredients.${index}.name`)}
                  placeholder="Tên nguyên liệu"
                  className="base-input flex-2"
                />
                <input
                  {...register(`ingredients.${index}.amount`)}
                  placeholder="Định lượng"
                  className="base-input flex-1"
                />
                <input
                  {...register(`ingredients.${index}.unit`)}
                  placeholder="Đơn vị"
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
        </section>

        {/* KHỐI 3: CÁCH LÀM */}
        <section className="edit-section">
          <h2 className="section-title">3. Cách làm</h2>
          <div className="dynamic-list steps-list">
            {stepFields.map((item, index) => {
              const currentImg = watch(`steps.${index}.imageUrl`);
              return (
                <div key={item.id} className="step-dynamic-card">
                  <div className="step-card-header">
                    <h3>Bước {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="btn-icon-danger-text"
                    >
                      Xóa bước này
                    </button>
                  </div>
                  <textarea
                    {...register(`steps.${index}.content`)}
                    className="base-textarea"
                    rows="3"
                  ></textarea>

                  <div className="step-image-upload">
                    {currentImg ? (
                      <div className="step-img-preview-box">
                        <img src={currentImg} alt={`Bước ${index + 1}`} />
                        <button
                          type="button"
                          className="btn-change-img"
                          onClick={() =>
                            setValue(`steps.${index}.imageUrl`, "")
                          }
                        >
                          Đổi/Xóa ảnh
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
        </section>

        {/* STICKY FOOTER ACTION BAR */}
        <div className="edit-sticky-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(-1)}
          >
            <X size={16} /> Hủy bỏ
          </button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            <Save size={16} /> {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};
