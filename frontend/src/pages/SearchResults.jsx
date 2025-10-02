import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Users, MapPin, Search } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ title, items, type }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'claims' && <FileText className="h-5 w-5" />}
          {type === 'documents' && <FileText className="h-5 w-5" />}
          {type === 'pattaHolders' && <Users className="h-5 w-5" />}
          {title} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.slice(0, 5).map(item => (
              <div key={item.id} className="p-3 border rounded-md hover:bg-muted/50">
                <p className="font-semibold">{item.applicant_name || item.title || item.holder_name}</p>
                <p className="text-sm text-muted-foreground">{item.village_name || item.category || item.patta_number}</p>
              </div>
            ))}
            {items.length > 5 && <p className="text-sm text-center text-muted-foreground">...and {items.length - 5} more.</p>}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No results found in this category.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground">Showing results for: "{query}"</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : results ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResultCard title="Claims" items={results.claims} type="claims" />
          <ResultCard title="Documents" items={results.documents} type="documents" />
          <ResultCard title="Patta Holders" items={results.pattaHolders} type="pattaHolders" />
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;