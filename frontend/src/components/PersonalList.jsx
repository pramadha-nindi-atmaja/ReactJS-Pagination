import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import ReactPaginate from "react-paginate";

const LIMIT = 10;

const PersonalList = () => {
  const [data, setData] = useState({
    personals: [],
    rows: 0,
    pages: 0,
    page: 0
  });

  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");

  const [sort, setSort] = useState({
    field: "id",
    direction: "asc",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [selectedPersonal, setSelectedPersonal] = useState(null);

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchPersonals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: keyword,
        limit: LIMIT,
        page: data.page,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const res = await axios.get(`/api/personals?${params.toString()}`);

      setData({
        personals: res.data.result,
        rows: res.data.totalRows,
        pages: res.data.totalPages,
        page: res.data.page,
      });

      setMsg("");
    } catch (error) {
      console.error(error);
      setMsg("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [keyword, data.page, sort.field, sort.direction]);

  useEffect(() => {
    fetchPersonals();
  }, [fetchPersonals]);

  // ======================================================
  // HANDLERS
  // ======================================================
  const handleSearch = (e) => {
    e.preventDefault();
    setData((prev) => ({ ...prev, page: 0 }));
    setKeyword(query);
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRefresh = () => {
    setQuery("");
    setKeyword("");
    setSort({ field: "id", direction: "asc" });
    setData((prev) => ({ ...prev, page: 0 }));
    setMsg("");
  };

  const handlePageChange = ({ selected }) => {
    setData((prev) => ({ ...prev, page: selected }));
    selected === 9 ? setMsg("Tidak ditemukan? Gunakan search box") : setMsg("");
  };

  const exportToCSV = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Gender", "IP"];
    const rows = data.personals.map((p) =>
      [p.id, p.first_name, p.last_name, p.email, p.gender, p.ip_address]
        .map((v) => `"${v}"`)
        .join(",")
    );

    const blob = new Blob(
      [[headers.join(","), ...rows].join("\n")],
      { type: "text/csv" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `personals_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const isLastPage = useMemo(
    () => data.page === data.pages - 1,
    [data.page, data.pages]
  );

  const getSortIcon = (field) =>
    sort.field === field ? (sort.direction === "asc" ? "↑" : "↓") : null;

  // ======================================================
  // VIEW
  // ======================================================
  return (
    <>
      <div className="container mt-5">
        <h1 className="title is-4">Personal Data List</h1>

        {/* Search + Buttons */}
        <div className="columns">
          <div className="column is-8">
            <form onSubmit={handleSearch}>
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
                  <button className="button is-info is-rounded">Search</button>
                </div>
              </div>
            </form>
          </div>

          <div className="column is-4">
            <div className="buttons is-right">
              <button
                className="button is-success is-rounded"
                disabled={!data.personals.length}
                onClick={exportToCSV}
              >
                Export to CSV
              </button>
              <button
                className="button is-light is-rounded"
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="has-text-centered my-5">
            <div className="is-size-3">Loading...</div>
            <progress className="progress is-small is-info" />
          </div>
        )}

        {/* No Data */}
        {!loading && !data.personals.length && (
          <div className="notification is-warning mt-4">
            No data found. Try another search.
          </div>
        )}

        {/* Table */}
        {!loading && data.personals.length > 0 && (
          <>
            <div className="table-container">
              <table className="table is-striped is-bordered is-fullwidth is-hoverable">
                <thead>
                  <tr>
                    {[
                      "id",
                      "first_name",
                      "last_name",
                      "email",
                      "gender",
                      "ip_address",
                    ].map((field) => (
                      <th
                        key={field}
                        className="is-clickable"
                        onClick={() => handleSort(field)}
                      >
                        {field.replace("_", " ").toUpperCase()} {getSortIcon(field)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.personals.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPersonal(p)}
                      className={selectedPersonal?.id === p.id ? "is-selected" : ""}
                    >
                      <td>{p.id}</td>
                      <td>{p.first_name}</td>
                      <td>{p.last_name}</td>
                      <td>{p.email}</td>
                      <td>{p.gender}</td>
                      <td>{p.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Page Info */}
            <div className="columns">
              <div className="column">
                <p>
                  Total Rows: {data.rows} — Page {data.page + 1} / {data.pages}
                  {isLastPage && data.rows > LIMIT * 10 && (
                    <span className="tag is-warning ml-2">
                      More results available. Refine search.
                    </span>
                  )}
                </p>
              </div>

              <div className="column has-text-right has-text-danger">{msg}</div>
            </div>

            {/* Pagination */}
            <nav className="pagination is-right is-rounded">
              <ReactPaginate
                previousLabel={"Prev"}
                nextLabel={"Next"}
                pageCount={Math.min(10, data.pages)}
                onPageChange={handlePageChange}
                containerClassName={"pagination-list"}
                pageLinkClassName={"pagination-link"}
                activeLinkClassName={"pagination-link is-current"}
              />
            </nav>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedPersonal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setSelectedPersonal(null)}></div>

          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Personal Details</p>
              <button className="delete" onClick={() => setSelectedPersonal(null)}></button>
            </header>

            <section className="modal-card-body">
              <div className="content">
                {Object.entries({
                  ID: selectedPersonal.id,
                  "First Name": selectedPersonal.first_name,
                  "Last Name": selectedPersonal.last_name,
                  Email: selectedPersonal.email,
                  Gender: selectedPersonal.gender,
                  "IP Address": selectedPersonal.ip_address,
                }).map(([label, value]) => (
                  <div className="field" key={label}>
                    <label className="label">{label}</label>
                    <input className="input" readOnly value={value} />
                  </div>
                ))}
              </div>
            </section>

            <footer className="modal-card-foot">
              <button className="button" onClick={() => setSelectedPersonal(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalList;
