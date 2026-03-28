import AdminSidebar from "../components/AdminSidebar";

function AdminLayout({ children }) {

  return (

    <div className="flex min-h-screen bg-gray-50">

      <AdminSidebar />

      <main className="flex-1 md:ml-0 p-6 md:p-10">
        {children}
      </main>

    </div>

  );

}

export default AdminLayout;