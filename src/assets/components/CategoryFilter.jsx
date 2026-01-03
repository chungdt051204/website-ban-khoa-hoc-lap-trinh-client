import { useContext } from "react";
import AppContext from "./AppContext";
import "./components-css/Filter.css";

export default function CategoryFilter({ onCategoryChange, selectedValue }) {
  const { categories } = useContext(AppContext);
  return (
    <>
      <select
        className="form-select"
        value={selectedValue}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">Lọc danh mục</option>
        {categories?.map((value) => {
          return (
            <option key={value._id} value={value._id}>
              {value.title}
            </option>
          );
        })}
      </select>
    </>
  );
}
