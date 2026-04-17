import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Filter, Download, Calendar, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import API from '../../lib/api';
import { toast } from 'sonner';

export function BookingMonitoring() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/admin/bookings');
      setBookings(data);
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await API.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Appointment status updated to ${newStatus}`);
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalRevenue = filteredBookings
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + (b.service?.price || b.price || 0), 0);

  const stats = [
    {
      title: 'Total Appointments',
      value: filteredBookings.length,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: filteredBookings.filter((b) => b.status === 'Completed').length,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: `₹${totalRevenue}`,
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  if (loading) return <div className="flex justify-center p-24"><Loader2 className="size-12 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight">Appointment Monitoring</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage and override service request statuses</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-white dark:bg-black/20 shadow-inner ${stat.color}`}>
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-heading font-black">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search service, customer, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-2xl bg-secondary/30 border-none font-bold"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-56 h-12 rounded-2xl bg-secondary/30 border-none font-bold">
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-none shadow-premium overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest pl-8">ID</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Service</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Participants</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Schedule</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Earnings</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest pr-8">Status Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking, index) => (
                  <TableRow key={booking._id} className="group hover:bg-secondary/10 transition-colors border-secondary/20">
                    <TableCell className="pl-8 font-mono text-[10px] font-bold text-muted-foreground">
                      #{booking._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="font-heading font-black text-sm">{booking.service?.title}</div>
                      {booking.isRecurring && (
                        <Badge variant="secondary" className="text-[8px] font-black h-4 px-1 bg-primary/10 text-primary border-none">RECURRING</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[8px] font-black px-1 border-primary/20 text-primary">USER</Badge>
                           <span className="text-xs font-bold">{booking.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[8px] font-black px-1 border-emerald-500/20 text-emerald-600">PRO</Badge>
                           <span className="text-xs font-bold">{booking.provider?.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold">{new Date(booking.date).toLocaleDateString()}</div>
                      <div className="text-[10px] font-medium text-muted-foreground">{booking.appointmentStartTime || booking.time_slot}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-black text-primary">₹{booking.price || booking.service?.price}</div>
                    </TableCell>
                    <TableCell className="pr-8">
                       <div className="flex items-center gap-2">
                          {updatingId === booking._id ? (
                            <div className="flex items-center gap-2 text-primary font-bold text-xs">
                               <Loader2 className="size-3 animate-spin" /> Updating...
                            </div>
                          ) : (
                            <Select 
                              value={booking.status} 
                              onValueChange={(val) => handleStatusUpdate(booking._id, val)}
                            >
                              <SelectTrigger className={`h-8 border-none text-[10px] font-black uppercase tracking-wider rounded-lg px-3 ${getStatusBadgeClass(booking.status)}`}>
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-none shadow-2xl">
                                 <SelectItem value="Pending">Pending</SelectItem>
                                 <SelectItem value="Accepted">Accepted</SelectItem>
                                 <SelectItem value="In Progress">In Progress</SelectItem>
                                 <SelectItem value="Completed">Completed</SelectItem>
                                 <SelectItem value="Rejected">Rejected</SelectItem>
                                 <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredBookings.length === 0 && (
              <div className="text-center py-24">
                <div className="size-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
                <h3 className="text-xl font-bold">No results found</h3>
                <p className="text-muted-foreground text-sm">Adjust your filters or search terms</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
