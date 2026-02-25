// Delegates entirely to the shared, validated SampleRequestForm component.
import SampleRequestForm from '../shared/SampleRequestForm';

const ROOFING_VOLUME_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 10 jobs/month', label: 'Under 10 jobs/month' },
  { value: '10-30 jobs/month', label: '10-30 jobs/month' },
  { value: '30-100 jobs/month', label: '30-100 jobs/month' },
  { value: '100+ jobs/month', label: '100+ jobs/month' },
];

export default function RoofingSampleForm() {
  return (
    <SampleRequestForm
      source="roofing"
      accentColor="#FF7A00"
      bgColor="#172840"
      businessLabel="Company Name or Website"
      businessPlaceholder="myroofingco.com or My Roofing Co"
      productLabel="What type of roofing work do you do?"
      productPlaceholder="e.g. residential re-roofs, storm damage repairs"
      volumeLabel="Approximate monthly jobs"
      volumeOptions={ROOFING_VOLUME_OPTIONS}
      bookCallAnchor="schedule-demo"
    />
  );
}