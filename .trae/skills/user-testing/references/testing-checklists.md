# Testing Checklists

## General Web App Checklist

### Functional Testing
- [ ] All buttons clickable and functional
- [ ] All forms validate correctly
- [ ] All links navigate to correct destinations
- [ ] Search returns relevant results
- [ ] Filters/sorting work correctly
- [ ] Pagination works
- [ ] CRUD operations (Create, Read, Update, Delete) work
- [ ] File uploads work (if applicable)

### Authentication & Authorization
- [ ] Signup works (email verification if applicable)
- [ ] Login works with valid credentials
- [ ] Login fails gracefully with invalid credentials
- [ ] Password reset flow works
- [ ] Session persists across page refresh
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] User permissions enforce correctly

### UI/UX
- [ ] Layout doesn't break on any screen size
- [ ] Images load correctly (no broken images)
- [ ] Text is readable (contrast, size, line-height)
- [ ] Loading states shown during async operations
- [ ] Error messages are clear and helpful
- [ ] Success feedback provided
- [ ] Empty states handled gracefully
- [ ] Modals/popovers open and close correctly

### Performance
- [ ] Initial page load < 3 seconds
- [ ] No console errors on any page
- [ ] No memory leaks (tabs don't slow down)
- [ ] Images optimized (lazy loading if applicable)
- [ ] API calls complete in reasonable time

### Browser & Device Testing
- [ ] Works on Chrome (desktop)
- [ ] Works on Safari (desktop)
- [ ] Works on mobile Safari (iOS)
- [ ] Works on mobile Chrome (Android)
- [ ] Responsive on tablet (768-1024px)
- [ ] Responsive on mobile (320-480px)

### Accessibility (Optional)
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus states visible
- [ ] Alt text on images
- [ ] Form labels associated correctly
- [ ] Color contrast passes WCAG AA

## Music Streaming App Checklist (PsalMix-specific)

### Player Functionality
- [ ] Play button starts playback
- [ ] Pause button pauses playback
- [ ] Skip forward/back works
- [ ] Volume control works
- [ ] Progress bar scrubbing works
- [ ] Playback continues when navigating pages
- [ ] Queue management works
- [ ] Shuffle and repeat toggles work

### Content Discovery
- [ ] Browse shows song library
- [ ] Search finds songs by title
- [ ] Search finds songs by artist
- [ ] Filters work (genre, mood, etc.)
- [ ] Recommendations display
- [ ] Recently played updates

### User Features
- [ ] Create playlist works
- [ ] Add songs to playlist works
- [ ] Remove from playlist works
- [ ] Rename playlist works
- [ ] Delete playlist works
- [ ] Like/favorite song works
- [ ] Share song generates correct link

### Mobile-Specific
- [ ] Background audio works (app minimized)
- [ ] Lock screen controls work
- [ ] Headphone controls work
- [ ] Offline mode works (if applicable)
- [ ] Battery usage is reasonable

## E-commerce Checklist

### Product Pages
- [ ] Images load and zoom works
- [ ] Variant selection updates price/image
- [ ] Add to cart works
- [ ] Quantity selector works
- [ ] Out of stock states display
- [ ] Reviews display correctly

### Cart & Checkout
- [ ] Cart updates quantities
- [ ] Remove from cart works
- [ ] Coupon codes apply
- [ ] Shipping calculator works
- [ ] Payment form validates
- [ ] Order confirmation shows

## SaaS Dashboard Checklist

### Data Display
- [ ] Tables render correctly
- [ ] Charts visualize accurately
- [ ] Filters update data
- [ ] Exports work (CSV, PDF, etc.)
- [ ] Real-time updates work (if applicable)

### Settings & Configuration
- [ ] Profile updates save
- [ ] Notification preferences work
- [ ] Integrations connect
- [ ] API keys generate
- [ ] Billing info updates
