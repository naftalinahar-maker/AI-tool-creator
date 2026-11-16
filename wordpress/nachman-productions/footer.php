<?php
/**
 * Site footer.
 *
 * @package nachman
 */

$np_socials = array_filter(
	array(
		'אינסטגרם' => np_opt( 'np_instagram' ),
		'טיקטוק'   => np_opt( 'np_tiktok' ),
		'יוטיוב'   => np_opt( 'np_youtube' ),
		'פייסבוק'  => np_opt( 'np_facebook' ),
	)
);
?>
<footer class="site-footer">
	<div class="container site-footer__inner">
		<div class="site-footer__brand">
			<img src="<?php echo np_img( 'logo.jpg' ); ?>" alt="נחמן הפקות" width="800" height="270" loading="lazy">
			<p>עריכת סרטים לכל מטרה, עד חצי שעה, במחיר הכי זול שיש.</p>
		</div>

		<div>
			<h3 class="site-footer__title">ניווט</h3>
			<?php np_fallback_menu(); ?>
		</div>

		<div>
			<h3 class="site-footer__title">יצירת קשר</h3>
			<ul class="site-footer__list">
				<?php if ( np_opt( 'np_email' ) ) : ?>
					<li><a href="mailto:<?php echo esc_attr( np_opt( 'np_email' ) ); ?>"><?php echo esc_html( np_opt( 'np_email' ) ); ?></a></li>
				<?php endif; ?>
				<?php foreach ( $np_socials as $label => $url ) : ?>
					<li><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $label ); ?></a></li>
				<?php endforeach; ?>
				<?php if ( ! np_opt( 'np_email' ) ) : ?>
					<li><a href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">השאירו פרטים בטופס</a></li>
				<?php endif; ?>
			</ul>
		</div>
	</div>
	<div class="container site-footer__bottom">
		<span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> נחמן הפקות · Nachman Productions</span>
		<a href="#top">חזרה למעלה ↑</a>
	</div>
</footer>


<?php wp_footer(); ?>
</body>
</html>
