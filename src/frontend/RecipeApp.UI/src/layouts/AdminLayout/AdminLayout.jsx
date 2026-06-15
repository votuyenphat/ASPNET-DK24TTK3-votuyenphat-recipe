import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="user-layout">
      {/* <Header /> */}
      <h1>Admin</h1>
      <main className="container mx-auto px-4 md:px-0">
        {" "}
        {/* Responsive container */}
        <Outlet /> {/* Các trang của User sẽ render ở đây */}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default AdminLayout;
