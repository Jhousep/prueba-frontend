import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import DebouncedInput from "./DebouncedInput";
import { useAuth } from '../auth/AuthProvider';
import { FaReceipt, FaBoxes, FaChevronLeft , FaChevronRight } from "react-icons/fa";

function TableTanstack({ invoices, isOpenVoucherModal, setIsOpenVoucherModal, setIsOpenProductDetailsModal, isOpenProductDetailsModal, setSelectInvoice }) {
  const auth = useAuth()
  useEffect(() => {
    setData(invoices)
  }, [invoices]);
  
  //Cambio de estados modals
  const toggleVoucherModal = (invoice_pk) => {
    setSelectInvoice(invoice_pk)
    setIsOpenVoucherModal(!isOpenVoucherModal);
    !isOpenVoucherModal ? document.body.style.overflow = 'hidden':  document.body.style.overflow = 'auto'
  };

  const toggleProductDetailsModal = (invoice_pk) => {
    setSelectInvoice(invoice_pk)
    setIsOpenProductDetailsModal(!isOpenProductDetailsModal);
    !isOpenProductDetailsModal ? document.body.style.overflow = 'hidden':  document.body.style.overflow = 'auto'
  };


  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("invoice_pk", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "# Invoice",
    }),
  columnHelper.accessor("name", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Client",
    }),
    columnHelper.accessor("date", {
      cell: (info) => <span>{new Date(info.getValue()).toLocaleDateString()}</span>,
      header: "Date",
    }),
    columnHelper.accessor("subtotal", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "subtotal",
    }),
    columnHelper.accessor("discount", {
      cell: (info) => <span>{info.getValue()}%</span>,
      header: "Discount",
    }),
    columnHelper.accessor("total", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Total",
    }),
    columnHelper.accessor("voucher", {
      cell: (info) => <button onClick={()=> toggleVoucherModal(info.row.original.invoice_pk)} className="bg-orange-400 p-3"> <FaReceipt size={30} /></button>,
      header: "Voucher",
    }),
    columnHelper.accessor("products", {
      cell: (info) => <button onClick={()=> toggleProductDetailsModal(info.row.original.invoice_pk)} className="bg-green-700 p-3"><FaBoxes size={30} /></button>,
      header: "Products",
    }),
  ];
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0, //custom initial page index
        pageSize: 4, //custom default page size
      },
    },
    state: {
      globalFilter
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className=" mx-auto text-white fill-gray-400">
      <div className="flex justify-between mb-2 text-black">
        <div className="w-full flex items-center gap-1">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            className="p-2 bg-transparent outline-none border-b-2 w-3/5 focus:w-2/5 duration-300 border-neutral-900"
            placeholder="Search all columns..."
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="border border-gray-700 w-full text-left">
          <thead className="bg-neutral-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="capitalize px-3.5 py-3">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`
                ${i % 2 === 0 ? "bg-neutral-700" : "bg-neutral-800"}
                `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3.5 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="text-center h-32 text-neutral-800">
                <td colSpan={12}>No Recoard Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      <div className="flex content-center justify-center items-center mt-2 gap-5">
        <div className="flex gap-2">
          <button
            onClick={() => {
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
            className="py-1 px-2 bg-neutral-900 hover:bg-neutral-800 rounded-md"
          >
            <FaChevronLeft size={18}/>
          </button>
          <button
            onClick={() => {
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
            className="py-1 px-2 bg-neutral-900 hover:bg-neutral-800 rounded-md"
          >
            <FaChevronRight size={18}/>
          </button>
        </div>

        <div>
          <span className="flex items-center gap-1 text-neutral-800">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
        </div>

      </div>
    </div>
  );
}

export default TableTanstack


