import { Outlet } from "react-router-dom";

export const UserLayout = () => {
  return (
    <div className="user-layout">
      {/* <Header /> */}
      <main className="container mx-auto px-4 md:px-0">
        {" "}
        {/* Responsive container */}
        <Outlet /> {/* Các trang của User sẽ render ở đây */}
      </main>
      {/* <Footer /> */}
    </div>
  );
};
