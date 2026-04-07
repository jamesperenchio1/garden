'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Leaf,
  Search,
  ImageIcon,
  Users,
  MapPin,
  Camera,
  FlaskConical,
  CalendarDays,
  Droplets,
  Mountain,
  Plus,
  ThumbsUp,
  MessageSquarePlus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cloud,
} from 'lucide-react';
import { db } from '@/lib/db';
import type { FeatureRequest } from '@/types/plant';
import { format } from 'date-fns';

interface BuiltInFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'live' | 'beta';
}

const FEATURES: BuiltInFeature[] = [
  {
    title: 'Smart Plant Search',
    description:
      'Live cascading search powered by Trefle + OpenFarm APIs. Type a plant name, pick from results, then narrow down by variety — all in real time.',
    icon: <Search className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Seed Packet OCR',
    description:
      'Snap a photo of a seed packet and let AI (Google Gemini) extract the plant name, variety, and growing instructions automatically.',
    icon: <Camera className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Plant Bank',
    description:
      'Track seeds and plants you own but haven\'t planted yet. Store quantities, then transition them to "growing" with one tap when you plant them.',
    icon: <Leaf className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Predefined Locations',
    description:
      'Create reusable locations organized by zone (e.g. Backyard > Raised Bed A, Indoor > Windowsill). Assign plants to locations for easy tracking.',
    icon: <MapPin className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Photo Gallery & Timeline',
    description:
      'Browse all plant photos chronologically, grouped by date. Filter by plant name or photo type. Full lightbox with navigation.',
    icon: <ImageIcon className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Companion Planting',
    description:
      'See which of your plants grow well together (and which conflict). Get suggestions for new plants that would benefit your existing garden.',
    icon: <Users className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Plant Health Tracking',
    description:
      'Tag plants with health issues — pests, diseases, nutrient deficiencies — with severity levels. Track health over time via logs.',
    icon: <Leaf className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Yield Tracking',
    description:
      'Record harvests with weight and quality ratings. Compare against reference yields to gauge plant performance.',
    icon: <FlaskConical className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Garden Calendar',
    description:
      'Auto-generated task calendar based on your plants. See upcoming watering, fertilizing, and harvesting tasks.',
    icon: <CalendarDays className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Weather Integration',
    description:
      'Local weather data to help plan garden activities. See current conditions and forecasts for your area.',
    icon: <Cloud className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Hydroponic System Designer',
    description:
      'Design and manage hydroponic, aeroponic, and aquaponic systems. Track nutrient solutions and system parameters.',
    icon: <Droplets className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Soil Planner',
    description:
      'Plan soil bed layouts, track soil composition, and manage amendments for optimal growing conditions.',
    icon: <Mountain className="h-5 w-5" />,
    status: 'live',
  },
  {
    title: 'Offline-First Storage',
    description:
      'All data stored locally in your browser via IndexedDB. Works offline — no account needed, your data stays on your device.',
    icon: <Sparkles className="h-5 w-5" />,
    status: 'live',
  },
];

export default function FeaturesPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(false);

  const loadRequests = async () => {
    const all = await db.featureRequests.orderBy('createdAt').reverse().toArray();
    setRequests(all);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await db.featureRequests.add({
      title: title.trim(),
      description: description.trim() || undefined,
      submittedBy: submittedBy.trim() || undefined,
      status: 'new',
      upvotes: 0,
      createdAt: new Date(),
    });
    setTitle('');
    setDescription('');
    setShowForm(false);
    await loadRequests();
    setSubmitting(false);
  };

  const handleUpvote = async (id: number, current: number) => {
    await db.featureRequests.update(id, { upvotes: current + 1 });
    await loadRequests();
  };

  const statusColor = (s: FeatureRequest['status']) => {
    switch (s) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'noted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'planned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const visibleFeatures = expandedFeatures ? FEATURES : FEATURES.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Features & Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Everything Garden Companion can do — and what you'd like it to do next.
        </p>
      </div>

      {/* Current Features */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Current Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleFeatures.map((f) => (
            <Card key={f.title} className="relative">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold">{f.title}</h3>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        {f.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {FEATURES.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setExpandedFeatures(!expandedFeatures)}
          >
            {expandedFeatures ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show All {FEATURES.length} Features
              </>
            )}
          </Button>
        )}
      </div>

      {/* Feature Requests / Feedback */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Feature Requests & Feedback</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <MessageSquarePlus className="h-4 w-4 mr-1" />
            {showForm ? 'Cancel' : 'Submit Feedback'}
          </Button>
        </div>

        {/* Submit form */}
        {showForm && (
          <Card className="mb-4 border-green-200 dark:border-green-800">
            <CardContent className="pt-4 space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Your Name <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. James"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Feature or Feedback <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Add watering reminders via push notifications"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Details <span className="text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  placeholder="Describe what you'd like and why it would be useful..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || submitting}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Submit
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Requests list */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquarePlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No feedback yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to suggest a feature or share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    {/* Upvote */}
                    <button
                      onClick={() => req.id && handleUpvote(req.id, req.upvotes)}
                      className="flex flex-col items-center gap-0.5 pt-0.5 text-muted-foreground hover:text-green-600 transition-colors shrink-0"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs font-medium">{req.upvotes}</span>
                    </button>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold">{req.title}</h4>
                        <Badge className={`text-[10px] ${statusColor(req.status)}`}>
                          {req.status}
                        </Badge>
                      </div>
                      {req.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {req.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                        {req.submittedBy && <span>by {req.submittedBy}</span>}
                        <span>{format(new Date(req.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
