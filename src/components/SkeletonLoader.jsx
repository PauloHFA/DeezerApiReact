import { Card, CardContent, CardMedia, Skeleton, Box, Grid } from '@mui/material';

/**
 * SkeletonCard - Card de carregamento
 */
export const SkeletonCard = ({ variant = 'default' }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
      }}
    >
      <Skeleton
        variant="rectangular"
        height={250}
        sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton
          variant="text"
          height={24}
          sx={{ mb: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
        <Skeleton
          variant="text"
          height={16}
          width="70%"
          sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
        {variant === 'track' && (
          <Skeleton
            variant="text"
            height={12}
            width="50%"
            sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          />
        )}
      </CardContent>
    </Card>
  );
};

/**
 * SkeletonGrid - Grid de cards de carregamento
 */
export const SkeletonGrid = ({ count = 8, xs = 12, sm = 6, md = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Grid item xs={xs} sm={sm} md={md} key={idx}>
          <SkeletonCard />
        </Grid>
      ))}
    </>
  );
};

/**
 * SkeletonTrackList - Skeleton para lista de tracks
 */
export const SkeletonTrackList = ({ count = 5 }) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant="text"
              height={20}
              sx={{ mb: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
            <Skeleton
              variant="text"
              height={14}
              width="60%"
              sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          </Box>
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      ))}
    </Box>
  );
};
