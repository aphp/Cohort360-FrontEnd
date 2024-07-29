export const checkIfPageAvailable = (
  count: number,
  currentPage: number,
  setPage: (page: number) => void,
  rowsPerPage = 20
) => {
  if (!(currentPage === 1 && count === 0)) {
    const totalPagesAvalaible = Math.ceil(count / rowsPerPage)
    if (totalPagesAvalaible < currentPage) {
      alert(
        `Le numéro de page indiqué dans l'url est supérieur au nombre de pages possible pour ce tableau qui est de ${totalPagesAvalaible}. En cliquant sur OK, vous serez redirigé vers la dernière page disponible.`
      )
      setPage(totalPagesAvalaible)
    }
  }
}
