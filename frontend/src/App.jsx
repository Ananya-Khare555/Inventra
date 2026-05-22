import { useState } from "react";
import { LayoutDashboard, Boxes, ClipboardList, Layers, PlusCircle } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import StockForm from "./pages/StockForm";
import AssetsPage from "./pages/AssetsPage";
import AssignForm from "./pages/AssignForm";
import Login from "./pages/Login";
import AssignedAssets from "./pages/AssignedAssets";
import TotalAssets from "./pages/TotalAssets";

const PAGE_TITLE_BY_PAGE = {
  dashboard: "Dashboard",
  available: "Available Assets",
  assigned: "Assigned Assets",
  total: "Total Assets",
  stock: "Update Stock",
  assign: "Assign Asset",
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }
 
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => setPage("dashboard")}>
          <div className="sidebar-logo">I</div>
          <div className="sidebar-title">Inventra</div>
        </div>

        <nav className="nav">
          <button className={`nav-item ${page==="dashboard"?"active":""}`} onClick={()=>setPage("dashboard")}>
              <LayoutDashboard size={18}/> Dashboard
          </button>

          <button className={`nav-item ${page==="available"?"active":""}`} onClick={()=>setPage("available")}>
              <Boxes size={18}/> Available Assets
          </button>

          <button className={`nav-item ${page==="assigned"?"active":""}`} onClick={()=>setPage("assigned")}>
              <ClipboardList size={18}/> Assigned Assets
          </button>

          <button className={`nav-item ${page==="total"?"active":""}`} onClick={()=>setPage("total")}>
              <Layers size={18}/> Total Assets
          </button>

          <button className={`nav-item ${page==="stock"?"active":""}`} onClick={()=>setPage("stock")}>
              <PlusCircle size={18}/> Update Stock
          </button>

          <button className={`nav-item ${page==="assign"?"active":""}`} onClick={()=>setPage("assign")}>
              <PlusCircle size={18}/> Assign Asset
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="topbar-title">{PAGE_TITLE_BY_PAGE[page] ?? "Inventra"}</div>
          <button className="logout-btn" type="button" onClick={() => setIsLoggedIn(false)}>
            Logout
          </button>
        </header>

        <div className="content-shell">
          {page === "dashboard" && <Dashboard setPage={setPage} />}
          {page === "available" && <AssetsPage />}
          {page === "assigned" && <AssignedAssets />}
          {page === "total" && <TotalAssets />}
          {page === "stock" && <StockForm />}
          {page === "assign" && <AssignForm />}
        </div>
      </main>
    </div>
  );
}

export default App;