// User service
export {
  getAllUsers,
  getUserById,
  getUserByPhone,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  loginByPhone,
} from './user.service';

// Room service
export {
  getAllRooms,
  getRoomById,
  getRoomsByAdminId,
  getRoomsByStatus,
  getVacantRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
} from './room.service';

// Rental service
export {
  getAllRentals,
  getRentalById,
  getRentalsByUserId,
  getRentalsByRoomId,
  getActiveRentalByRoomId,
  getActiveRentals,
  createRental,
  updateRental,
  endRental,
  deleteRental,
} from './rental.service';

// Meter service
export {
  getAllMeters,
  getMeterById,
  getMetersByRentalId,
  getMeterByRentalTypeMonth,
  getLastMeterReading,
  createMeter,
  updateMeter,
  confirmMeter,
  calculateConsumption,
  deleteMeter,
} from './meter.service';

// Invoice service
export {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByRentalId,
  getInvoiceByRentalAndMonth,
  getUnpaidInvoices,
  getOverdueInvoices,
  createInvoice,
  generateInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  markInvoiceAsFailed,
  deleteInvoice,
} from './invoice.service';

// Issue service
export {
  getAllIssues,
  getIssueById,
  getIssuesByRentalId,
  getIssuesByStatus,
  getPendingIssues,
  createIssue,
  updateIssue,
  updateIssueStatus,
  markIssueAsProcessing,
  markIssueAsDone,
  deleteIssue,
} from './issue.service';
