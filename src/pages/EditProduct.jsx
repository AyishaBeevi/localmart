import { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: ""
  });

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res =  await API.get(`/products/${id}`);
        const data = res.data;

        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          category: data.category || "",
          location: data.location || ""
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     await API.put(`/products/slug/${id}`, form);

      // 👇 redirect after resubmit
      navigate("/my-listings");

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-3xl mx-auto p-8">

      <h2 className="text-2xl font-bold mb-6">
        Edit Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          rows={4}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg px-4 py-2"
              value={form.category}
              onChange={(e)=>setForm({...form,category:e.target.value})}
            >
              <option value="electronics">Electronics</option>
              <option value="vehicles">Vehicles</option>
              <option value="furniture">Furniture</option>
              <option value="pets">Pets</option>
              <option value="books">Books</option>
              <option value="sports">Sports</option>
              <option value="fashion">Fashion</option>
              <option value="others">Others</option>
            </select>
</div>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-brand text-white px-6 py-2 rounded-lg"
          >
            Save & Resubmit
          </button>

          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

export default EditProduct;