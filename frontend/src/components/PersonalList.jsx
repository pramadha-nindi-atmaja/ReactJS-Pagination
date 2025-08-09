import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import ReactPaginate from "react-paginate";

const LIMIT = 10;

const PersonalList = () => {
  const [personals, setPersonals] = useState([]);
  const [page, setPage] = useState(0);
  const [limit] = useState(LIMIT);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedPersonal, setSelectedPersonal] = useState(null);

  const getPersonals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/personals?search=${keyword}&limit=${limit}&page=${page}&sortField=${sortField}&sortDirection=${sortDirection}`
      );
      setPersonals(response.data.result);
      setPage(response.data.page);
      setPages(response.data.totalPages);
      setRows(response.data.totalRows);
      setMsg("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setMsg("Error fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [page, keyword, limit, sortField, sortDirection]);

  useEffect(() => {
    getPersonals();
  }, [getPersonals]);

  const pageChange = ({ selected }) => {
    setPage(selected);
    if (selected === 9) {
      setMsg("Tidak ditemukan? Gunakan search box");
    } else {
      setMsg("");
    }
  };

  const searchData = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(query);
    setMsg("");
  };

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const handleRefresh = () => {
    setKeyword("");
    setQuery("");
    setPage(0);
    setSortField("id");
    setSortDirection("asc");
  };

  const handleRowClick = (personal) => {
    setSelectedPersonal(personal);
  };

  const closeDetails = () => {
    setSelectedPersonal(null);
  };

  const exportToCSV = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Gender", "IP"];
    const csvContent = [
      headers.join(","),
      ...personals.map((personal) => 
        [
          personal.id,
          `"${personal.first_name}"`,
          `"${personal.last_name}"`,
          `"${personal.email}"`,
          `"${personal.gender}"`,
          `"${personal.ip_address}"`
        ].join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personals_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const isLastPage = useMemo(() => page === pages - 1, [page, pages]);

  return (
    <>
      <div className="container mt-5">
        <div className="columns">
          <div className="column is-centered">
            <h1 className="title is-4">Personal Data List</h1>
            <div className="columns">
              <div className="column is-8">
                <form onSubmit={searchData}>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <input
                        type="text"
                        className="input is-rounded"
                        placeholder="Search ..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="control">
                      <button type="submit" className="button is-rounded is-info">
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="column is-4">
                <div className="buttons is-right">
                  <button 
                    className="button is-success is-rounded" 
                    onClick={exportToCSV}
                    disabled={personals.length === 0}
                  >
                    Export to CSV
                  </button>
                  <button className="button is-light is-rounded" onClick={handleRefresh}>
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="has-text-centered my-5">
                <div className="is-loading is-size-3">Loading...</div>
                <progress className="progress is-small is-info" max="100"></progress>
              </div>
            ) : personals.length === 0 ? (
              <div className="notification is-warning mt-4">
                No data found. Try a different search term.
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="table is-striped is-bordered is-fullwidth mt-2 is-hoverable">
                    <thead>
                      <tr>
                        <th className="is-clickable" onClick={() => handleSort("id")}>
                          ID {getSortIcon("id")}
                        </th>
                        <th className="is-clickable" onClick={() => handleSort("first_name")}>
                          First Name {getSortIcon("first_name")}
                        </th>
                        <th className="is-clickable" onClick={() => handleSort("last_name")}>
                          Last Name {getSortIcon("last_name")}
                        </th>
                        <th className="is-clickable" onClick={() => handleSort("email")}>
                          Email {getSortIcon("email")}
                        </th>
                        <th className="is-clickable" onClick={() => handleSort("gender")}>
                          Gender {getSortIcon("gender")}
                        </th>
                        <th className="is-clickable" onClick={() => handleSort("ip_address")}>
                          IP {getSortIcon("ip_address")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {personals.map((personal) => (
                        <tr 
                          key={personal.id}
                          onClick={() => handleRowClick(personal)}
                          className={selectedPersonal?.id === personal.id ? "is-selected" : ""}
                        >
                          <td>{personal.id}</td>
                          <td>{personal.first_name}</td>
                          <td>{personal.last_name}</td>
                          <td>{personal.email}</td>
                          <td>{personal.gender}</td>
                          <td>{personal.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="columns">
                  <div className="column is-6">
                    <p>
                      Total Rows: {rows.toLocaleString("en-US")} Page:{" "}
                      {rows ? page + 1 : 0} of {pages.toLocaleString("en-US")}
                      {isLastPage && rows > LIMIT * 10 && (
                        <span className="tag is-warning ml-2">
                          More results available. Refine your search.
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="column is-6">
                    <p className="has-text-danger has-text-right">{msg}</p>
                  </div>
                </div>
                <nav
                  className="pagination is-right is-rounded"
                  key={rows}
                  role="navigation"
                  aria-label="pagination"
                >
                  <ReactPaginate
                    previousLabel={"Prev"}
                    nextLabel={"Next"}
                    pageCount={Math.min(10, pages)}
                    onPageChange={pageChange}
                    containerClassName={"pagination-list"}
                    pageLinkClassName={"pagination-link"}
                    previousLinkClassName={"pagination-previous"}
                    nextLinkClassName={"pagination-next"}
                    activeLinkClassName={"pagination-link is-current"}
                    disabledLinkClassName={"pagination-link is-disabled"}
                  />
                </nav>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedPersonal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeDetails}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Personal Details</p>
              <button 
                className="delete" 
                aria-label="close" 
                onClick={closeDetails}
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="content">
                <div className="field">
                  <label className="label">ID</label>
                  <div className="control">
                    <input 
                      className="input" 
                      type="text" 
                      value={selectedPersonal.id} 
                      readOnly
                    />
                  </div>
                </div>
                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label">First Name</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="text" 
                          value={selectedPersonal.first_name} 
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="column">
                    <div className="field">
                      <label className="label">Last Name</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="text" 
                          value={selectedPersonal.last_name} 
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input 
                      className="input" 
                      type="email" 
                      value={selectedPersonal.email} 
                      readOnly
                    />
                  </div>
                </div>
                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label">Gender</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="text" 
                          value={selectedPersonal.gender} 
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="column">
                    <div className="field">
                      <label className="label">IP Address</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="text" 
                          value={selectedPersonal.ip_address} 
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button className="button" onClick={closeDetails}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalList;