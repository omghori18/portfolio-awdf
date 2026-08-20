function SearchBar({ value, onChange }) {
  return (
    <section className="project-toolbar">
      <input
        type="text"
        className="project-search"
        placeholder="Search repositories by name"
        value={value}
        onChange={onChange}
      />
    </section>
  )
}

export default SearchBar
