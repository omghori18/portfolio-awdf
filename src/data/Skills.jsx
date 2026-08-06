function Skills({ skillList }) {
  return (
    <section className="card">
      <h2>Skills</h2>
      <ul className="skill-list">
        {skillList.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  )
}

export default Skills
