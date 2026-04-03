import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import toast from "react-hot-toast";
import { handleError } from "../utils/errorHandler";
import { Helmet } from "react-helmet-async";

function ProductPage() {

  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showReport, setShowReport] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
const [reportReason, setReportReason] = useState("");

const baseUrl = window.location.origin;

 const toggleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Login required");
      return;
    }

    const res = await API.post(
      `/users/save-product/${product.slug}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const isSaved = res.data.savedProducts.some(
      (id) => id.toString() === product._id.toString()
    );

    setSaved(isSaved);

    toast.success(isSaved ? "Saved ❤️" : "Removed from saved");

  } catch (err) {
    handleError("Save toggle error", err);
    toast.error("Failed to update saved items");
  }
};

  
  // START CHAT
  const startChat = async () => {
    try {

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Login to chat with seller");
        return;
      }

      const res = await API.post(
        "/chat/start",
        {
          sellerId: product.user._id,
          slug: product.slug
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/chat/${res.data._id}`);

    } catch (err) {
     handleError("Chat start error", err);
    }
  };


  // FETCH PRODUCT
  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const res = await API.get(`/products/${slug}`);

        setProduct(res.data);

        if (res.data.images?.length) {
          setSelectedImage(res.data.images[0]);
        }

        // // FETCH SIMILAR PRODUCTS
        if (res.data.category) {

          const similar = await API.get(
            `/products/category/${res.data.category}`
          );

          setSimilarProducts(
            similar.data.filter((p) => p._id !== res.data._id)
          );

        }

      } catch (err) {
        // handleError("Failed to load product", err);
        console.error(err.response?.data || err.message);
      }

      setLoading(false);
    };

    fetchProduct();

  }, [slug]);


  if (loading) {
    return (
      <div className="p-20 text-center text-textMuted">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-20 text-center text-red-500">
        Product not found
      </div>
    );
  }

const reportProduct = async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login to report listings");
    return;
  }

  if (!reportReason) {
    toast.error("Please select a reason");
    return;
  }

  try {

    await API.post(
      "/reports",
      {
        slug: product.slug,
        reason: reportReason,
        details: reportDetails
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    toast.success("Report submitted");

    setShowReport(false);
    setReportReason("");
    setReportDetails("");

  } catch (err) {

    handleError(err);
    toast.error("Failed to submit report");

  }

};
  return (

  <div className="max-w-7xl mx-auto p-8">

    {/* SEO  */}
    <Helmet>
  <title>
    {`${product.title} in ${product.location} - ₹${product.price} | LocalMart`}
  </title>

  <meta
    name="description"
    content={product.description?.slice(0, 150)}
  />

  {/* Canonical */}
  <link
    rel="canonical"
    href={`${baseUrl}/product/${product.slug}`}
  />


      {/* Open Graph */}
      <meta property="og:title" content={product.title} />
      <meta property="og:description" content={product.description} />
      <meta property="og:image" content={product.images?.[0]} />
      <meta property="og:type" content="product" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.title,
          image: product.images,
          description: product.description,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock"
          }
        })}
      </script>
    </Helmet>

    {/* PRODUCT SECTION */}
    <div className="grid md:grid-cols-2 gap-12">

      {/* IMAGE */}
      <div>
        <Zoom>
          {selectedImage && (
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-[450px] object-cover rounded-xl shadow cursor-zoom-in"
            />
          )}
        </Zoom>

        <div className="flex gap-3 mt-4 flex-wrap">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="thumbnail"
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                selectedImage === img
                  ? "border-black"
                  : "border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* INFO */}
      <div className="flex flex-col gap-5">

        <h1 className="text-3xl font-bold">{product.title}</h1>

        <p className="text-3xl text-green-600 font-semibold">
          ₹{product.price}
        </p>

        <p className="text-gray-600">{product.description}</p>

        {/* SAVE */}
        <button
          onClick={toggleSave}
          className="border px-5 py-2 rounded-lg w-fit hover:bg-gray-100"
        >
          {saved ? "Saved ❤️" : "Save Item ♡"}
        </button>

        {/* SELLER */}
        <div className="border rounded-xl p-5 flex justify-between items-center">

          <Link
            to={`/seller/${product.user?._id}`}
            className="flex items-center gap-4"
          >
            <img
              src={
                product.user?.avatar ||
                `https://ui-avatars.com/api/?name=${product.user?.name}`
              }
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold hover:underline">
                {product.user?.name}
              </p>
              <p className="text-sm text-gray-500">Seller</p>
            </div>
          </Link>

          <button
            onClick={startChat}
            className="bg-brand text-white px-6 py-2 rounded-lg"
          >
            Chat
          </button>
        </div>

        {/* DETAILS */}
        <div className="border rounded-xl p-5">

          <h2 className="font-semibold mb-4">Product Details</h2>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <p>Category</p>
            <p className="font-medium">{product.category}</p>

            <p>Condition</p>
            <p className="font-medium">
              {product.condition || "New"}
            </p>

            <p>Listed On</p>
            <p className="font-medium">
              {new Date(product.createdAt).toDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReport(true)}
          className="text-red-500 text-sm"
        >
          Report listing
        </button>

      </div>
    </div>

    {/* REPORT MODAL */}
    {showReport && (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl w-[420px]">

          <h2 className="font-semibold mb-4">Report Listing</h2>

          {["Spam","Scam","Fake listing","Wrong category"].map(r => (
            <label key={r} className="flex gap-2 text-sm">
              <input
                type="radio"
                value={r}
                onChange={(e) => setReportReason(e.target.value)}
              />
              {r}
            </label>
          ))}

          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            className="w-full border mt-3 p-2 rounded"
            rows={3}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowReport(false)}>Cancel</button>

            <button
              disabled={!reportReason}
              onClick={reportProduct}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    )}

    {/* SIMILAR */}
    {similarProducts.length > 0 && (
      <div className="mt-16">

        <h2 className="text-2xl font-bold mb-6">
          Similar Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {similarProducts.slice(0,8).map(item => (
            <Link
              key={item._id}
              to={`/product/${item.slug}`}
              className="border rounded-xl overflow-hidden"
            >
              <img
                src={item.images?.[0]}
                className="w-full h-40 object-cover"
              />

              <div className="p-3">
                <p className="truncate font-semibold">
                  {item.title}
                </p>
                <p className="text-green-600 font-bold">
                  ₹{item.price}
                </p>
              </div>
            </Link>
          ))}

        </div>
      </div>
    )}

  </div>
);
}

export default ProductPage;